# frozen_string_literal: true

class CreateUserAllergens < ActiveRecord::Migration[8.1]
  def change
    create_table :user_allergens do |t|
      t.references :user, null: false, foreign_key: true
      t.references :allergen, null: false, foreign_key: true

      t.timestamps
    end

    add_index :user_allergens, %i[user_id allergen_id], unique: true
  end
end
