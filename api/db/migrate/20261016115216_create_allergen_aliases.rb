# frozen_string_literal: true

class CreateAllergenAliases < ActiveRecord::Migration[8.1]
  def change
    create_table :allergen_aliases do |t|
      t.references :allergen, null: false, foreign_key: true
      t.string :name, null: false

      t.timestamps
    end

    # Globally unique (not scoped to allergen): the same alias text matching
    # two different allergens would make OCR matching ambiguous. A plain
    # index is enough since the model always stores name downcased.
    add_index :allergen_aliases, :name, unique: true
  end
end
