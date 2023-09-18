import "./Avatar.css";

interface AvatarProps {
  login?: string;
  path?: string;
}

export default function Avatar({ login, path }: AvatarProps) {
  // If the user has an avatarUrl, use that
  if (path) {
    const avatarUrl = `http://localhost:3001/${path}`;
    return <img className="avatar" src={avatarUrl} alt="avatar" />;
  }

  // Otherwise, generate an avatar using the user's login
  return (
    <img
      className="avatar"
      src={`https://api.dicebear.com/7.x/croodles/svg?seed=${login}`}
      alt="avatar"
    />
  );
}
