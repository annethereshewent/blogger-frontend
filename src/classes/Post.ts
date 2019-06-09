import { User } from './User';

export class Post {
  id: number;
  created_at: string;
  updated_at: string;
  post: string;
  edited: Boolean;
  num_comments: number;
  avatar: string;
  username: string;
  images: string[];
  user_id: number;
  tags: string[];
  user: User;
}
