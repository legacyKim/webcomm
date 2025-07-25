-- CreateTable
CREATE TABLE "site_settings" (
    "id" SERIAL NOT NULL,
    "logo_url" VARCHAR(255),
    "site_name" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "site_settings_pkey" PRIMARY KEY ("id")
);
