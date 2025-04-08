import React from 'react';
import { useParams } from 'react-router-dom';
import PollDetail from '../components/PollDetail';

function PollPage() {
  const { id } = useParams(); // Get the poll ID from the URL

  return (
    <div>
      {/* Heading moved inside PollDetail for better context */}
      <PollDetail pollId={id} />
    </div>
  );
}

export default PollPage;