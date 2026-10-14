# frozen_string_literal: true

require "rails_helper"

RSpec.describe User, type: :model do
  it "is valid with a valid email and password" do
    user = build(:user)
    expect(user).to be_valid
  end

  it "requires an email" do
    user = build(:user, email: nil)
    expect(user).not_to be_valid
  end

  it "rejects malformed emails" do
    user = build(:user, email: "not-an-email")
    expect(user).not_to be_valid
  end

  it "requires a unique email, case-insensitively" do
    create(:user, email: "someone@example.com")
    duplicate = build(:user, email: "Someone@Example.com")

    expect(duplicate).not_to be_valid
  end

  it "reports the uniqueness violation on the email attribute" do
    create(:user, email: "someone@example.com")
    duplicate = build(:user, email: "Someone@Example.com")
    duplicate.valid?

    expect(duplicate.errors[:email]).to be_present
  end

  it "normalizes email to a stripped, downcased form" do
    user = create(:user, email: "  Someone@Example.com  ")
    expect(user.email).to eq("someone@example.com")
  end

  it "requires a password of at least 8 characters on create" do
    user = build(:user, password: "short")
    expect(user).not_to be_valid
  end

  it "hashes the password instead of storing it in plain text" do
    user = create(:user, password: "password123")
    expect(user.password_digest).not_to eq("password123")
  end

  it "authenticates with the correct password" do
    user = create(:user, password: "password123")
    expect(user.authenticate("password123")).to eq(user)
  end

  it "does not authenticate with the wrong password" do
    user = create(:user, password: "password123")
    expect(user.authenticate("wrong")).to be_falsey
  end

  it "does not require a password on update when it is unchanged" do
    user = create(:user)
    user.last_login_at = Time.current

    expect(user.save).to be(true)
  end
end
