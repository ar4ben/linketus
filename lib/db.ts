export type Profile = {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
};

export type Slot = {
  id: string;
  creator_id: string;
  title: string;
  start_at: string;
  end_at: string;
  created_at: string;
  creator?: Profile | null;
};

export type CheckIn = {
  id: string;
  slot_id: string;
  user_id: string;
  emoji: string;
  created_at: string;
  profiles?: Pick<Profile, "id" | "full_name" | "avatar_url"> | null;
};
