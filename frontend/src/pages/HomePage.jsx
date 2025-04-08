import React from 'react';
import PollList from '../components/PollList';

function HomePage() {
  return (
    <div>
      <h1>Available Polls</h1>
      <PollList />
    </div>
  );
}

export default HomePage;