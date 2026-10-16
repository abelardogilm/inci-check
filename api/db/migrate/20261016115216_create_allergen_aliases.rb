# frozen_string_literal: true

class CreateAllergenAliases < ActiveRecord::Migration[8.1]
  def change
    create_table :allergen_aliases do |t|
      t.references :allergen, null: false, foreign_key: true
      t.string :name, null: false

      t.timestamps
    end

    # Globally unique (not scoped to allergen): the same alias text matching
    # two different allergens would make OCR matching ambiguous.
    add_index :allergen_aliases, "lower(name)", unique: true, name: "index_allergen_aliases_on_lower_name"
  end
end
