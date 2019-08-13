import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

import itsamatch from '../../assets/itsamatch.png';
import logo from '../../assets/logo.svg';
import dislike from '../../assets/dislike.svg';
import like from '../../assets/like.svg';
import {
  Container,
  List,
  ButtonsContainer,
  Button,
  Empty,
  MatchContainer
} from './styles';
import api from '../../services/api';
import { Link } from 'react-router-dom';

export default function Main({ match, bgColor }) {
  const [users, setUsers] = useState([]);
  const [matchDev, setMatchDev] = useState(null);

  useEffect(() => {
    async function loadUsers() {
      const response = await api.get('/devs', {
        headers: { user: match.params.id }
      });

      setUsers(response.data);
    }
    loadUsers();
  }, [match.params.id]);

  useEffect(() => {
    const socket = io(process.env.REACT_APP_API_URL, {
      query: { user: match.params.id }
    });

    socket.on('match', dev => {
      setMatchDev(dev);
    });
  }, [match.params.id]);

  async function handleLike(id) {
    await api.post(`/devs/${id}/likes`, null, {
      headers: { user: match.params.id }
    });
    setUsers(users.filter(user => user._id !== id));
  }

  async function handleDislike(id) {
    await api.post(`/devs/${id}/dislikes`, null, {
      headers: { user: match.params.id }
    });
    setUsers(users.filter(user => user._id !== id));
  }

  return (
    <Container bgColor={bgColor}>
      <Link to="/">
        <img src={logo} alt="Tindev" />
      </Link>
      {users.length > 0 ? (
        <List>
          {users.map(user => (
            <li key={user._id}>
              <img src={user.avatar} alt={user.name} />
              <footer>
                <strong>{user.name}</strong>
                <p>{user.bio}</p>
              </footer>

              <ButtonsContainer>
                <Button type="button" onClick={() => handleDislike(user._id)}>
                  <img src={dislike} alt="Dislike" />
                </Button>
                <Button type="button" onClick={() => handleLike(user._id)}>
                  <img src={like} alt="Like" />
                </Button>
              </ButtonsContainer>
            </li>
          ))}
        </List>
      ) : (
        <Empty>Game over :(</Empty>
      )}

      {matchDev && (
        <MatchContainer>
          <img src={itsamatch} alt="It's a match" />

          <img className="avatar" src={matchDev.avatar} alt="Avatar" />
          <strong>{matchDev.name}</strong>
          <p>{matchDev.bio}</p>

          <button type="button" onClick={() => setMatchDev(null)}>
            CLOSE
          </button>
        </MatchContainer>
      )}
    </Container>
  );
}
