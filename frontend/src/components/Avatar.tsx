import "./Avatar.css";

interface AvatarProps {
  login?: string;
  avatarUrl?: string;
}

export default function Avatar({ login, avatarUrl }: AvatarProps) {
  // If the user has a custom avatar, use that
  if (avatarUrl) {
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
