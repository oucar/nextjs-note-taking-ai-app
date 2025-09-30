type EntryCardProps = {
  entry: {
    createdAt: string | Date;
    analysis?: { summary?: string | null; mood?: string | null } | null;
  };
};

const EntryCard = ({ entry }: EntryCardProps) => {
  const date = new Date(entry.createdAt).toDateString();
  const summary = entry.analysis?.summary ?? 'No analysis yet.';
  const mood = entry.analysis?.mood ?? '—';

  return (
    <div className='divide-y divide-gray-200 overflow-hidden rounded-lg bg-white shadow'>
      <div className='px-4 py-5 sm:px-6'>{date}</div>
      <div className='px-4 py-5 sm:p-6'>{summary}</div>
      <div className='px-4 py-4 sm:px-6'>{mood}</div>
    </div>
  );
};

export default EntryCard;
