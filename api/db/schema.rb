# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# This file is the source Rails uses to define your schema when running `bin/rails
# db:schema:load`. When creating a new database, `bin/rails db:schema:load` tends to
# be faster and is potentially less error prone than running all of your
# migrations from scratch. Old migrations may fail to apply correctly if those
# migrations use external dependencies or application code.
#
# It's strongly recommended that you check this file into your version control system.

ActiveRecord::Schema[8.1].define(version: 2026_10_16_115223) do
  create_table "allergen_aliases", force: :cascade do |t|
    t.integer "allergen_id", null: false
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "lower(name)", name: "index_allergen_aliases_on_lower_name", unique: true
    t.index ["allergen_id"], name: "index_allergen_aliases_on_allergen_id"
  end

  create_table "allergens", force: :cascade do |t|
    t.string "name", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "lower(name)", name: "index_allergens_on_lower_name", unique: true
  end

  create_table "user_allergens", force: :cascade do |t|
    t.integer "user_id", null: false
    t.integer "allergen_id", null: false
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index ["allergen_id"], name: "index_user_allergens_on_allergen_id"
    t.index ["user_id", "allergen_id"], name: "index_user_allergens_on_user_id_and_allergen_id", unique: true
    t.index ["user_id"], name: "index_user_allergens_on_user_id"
  end

  create_table "users", force: :cascade do |t|
    t.string "email", null: false
    t.string "password_digest", null: false
    t.datetime "last_login_at"
    t.datetime "created_at", null: false
    t.datetime "updated_at", null: false
    t.index "lower(email)", name: "index_users_on_lower_email", unique: true
  end

  add_foreign_key "allergen_aliases", "allergens"
  add_foreign_key "user_allergens", "allergens"
  add_foreign_key "user_allergens", "users"
end
