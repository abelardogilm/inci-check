# frozen_string_literal: true

class CreateAllergens < ActiveRecord::Migration[8.1]
  def change
    create_table :allergens do |t|
      t.string :name, null: false

      t.timestamps
    end

    add_index :allergens, "lower(name)", unique: true, name: "index_allergens_on_lower_name"
  end
end
