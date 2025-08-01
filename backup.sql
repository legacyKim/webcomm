generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DB_URL")
}

model Board {
  id         Int    @id @default(autoincrement())
  board_name String @unique @db.VarChar(255)
  url_slug   String @db.VarChar(255)
  seq        Int    @default(autoincrement())
  posts      Post[]

  @@map("boards")
}

model Member {
  id            Int      @id @default(autoincrement())
  user_id       String   @unique @db.VarChar(50)
  email         String   @unique @db.VarChar(100)
  all_posts     Int      @default(0)
  authority     Int      @default(0)
  all_views     Int      @default(0)
  password      String
  user_nickname String?  @unique(map: "members_usernickname_key") @db.VarChar(50)
  profile       String?  @db.VarChar(255)
  createdAt     DateTime @default(now()) @map("created_at")
  updatedAt     DateTime @default(now()) @updatedAt @map("updated_at")

  @@map("members")
}

model Post {
  id            Int      @id @default(autoincrement())
  board_name    String   @db.VarChar(255)
  title         String   @db.VarChar(255)
  content       String
  user_id       String   @db.VarChar(50)
  views         Int      @default(0)
  likes         Int      @default(0)
  dislikes      Int      @default(0)
  reports       Int      @default(0)
  created_at    DateTime @default(now())
  updated_at    DateTime @default(now())
  url_slug      String   @db.VarChar(255)
  user_nickname String?  @db.VarChar(255)
  board_id      Int      @default(1)
  board         Board    @relation(fields: [board_id], references: [id])

  @@map("posts")
}

model Comment {
  id            Int      @id @default(autoincrement())
  post_id       Int
  user_id       String   @db.VarChar(255)
  content       String
  parent_id     Int?
  created_at    DateTime @default(now())
  updated_at    DateTime @default(now())
  likes         Int      @default(0)
  dislikes      Int      @default(0)
  user_nickname String?  @db.VarChar(255)

  @@map("comments")
}

model PostAction {
  id          Int      @id @default(autoincrement())
  post_id     Int
  user_id     Int
  action_type String   @db.VarChar(50)
  created_at  DateTime @default(now())

  @@unique([post_id, user_id, action_type])
  @@map("post_actions")
}

model CommentAction {
  id          Int      @id @default(autoincrement())
  comment_id  Int
  user_id     Int
  action_type String
  reason      String?
  created_at  DateTime @default(now())

  @@unique([comment_id, user_id, action_type], map: "unique_comment_user_action")
  @@map("comment_actions")
}

model PostImage {
  id         Int      @id @default(autoincrement())
  post_id    Int
  image_url  String
  created_at DateTime @default(now())

  @@map("post_images")
}

model BlockedUser {
  id        Int      @id @default(autoincrement())
  blockerId String   @db.VarChar(50)
  blockedId String   @db.VarChar(50)
  createdAt DateTime @default(now()) @map("created_at")

  @@unique([blockerId, blockedId])
  @@map("blocked_users")
}

model UserReport {
  id         Int      @id @default(autoincrement())
  reporterId String   @db.VarChar(50)
  reportedId String   @db.VarChar(50)
  reason     String
  createdAt  DateTime @default(now()) @map("created_at")

  @@map("user_reports")
}


