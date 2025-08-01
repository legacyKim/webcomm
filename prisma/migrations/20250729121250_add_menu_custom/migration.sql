-- CreateTable
CREATE TABLE "menu_customs" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "board_id" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "menu_customs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "menu_customs_user_id_board_id_key" ON "menu_customs"("user_id", "board_id");

-- AddForeignKey
ALTER TABLE "menu_customs" ADD CONSTRAINT "menu_customs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "members"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "menu_customs" ADD CONSTRAINT "menu_customs_board_id_fkey" FOREIGN KEY ("board_id") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
