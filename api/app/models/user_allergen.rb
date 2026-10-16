# frozen_string_literal: true

class UserAllergen < ApplicationRecord
  belongs_to :user
  belongs_to :allergen

  validates :allergen_id, uniqueness: { scope: :user_id }
end
