require "test_helper"

class MybbPasswordVerifierTest < ActiveSupport::TestCase
  UserPassword = Data.define(
    :password,
    :salt,
    :password_algorithm,
    :password_encryption
  )

  test "accepts a valid legacy MyBB salted MD5 password" do
    user = legacy_user("correct horse")

    assert MybbPasswordVerifier.valid?(user, "correct horse")
    refute MybbPasswordVerifier.valid?(user, "wrong password")
  end

  test "accepts a valid bcrypt password" do
    user = UserPassword.new(
      password: BCrypt::Password.create("correct horse").to_s,
      salt: "",
      password_algorithm: "bcrypt",
      password_encryption: 0
    )

    assert MybbPasswordVerifier.valid?(user, "correct horse")
    refute MybbPasswordVerifier.valid?(user, "wrong password")
  end

  test "rejects encrypted and unknown password formats" do
    encrypted_user = legacy_user("correct horse").with(password_encryption: 1)
    unknown_user = legacy_user("correct horse").with(password_algorithm: "unknown")

    refute MybbPasswordVerifier.valid?(encrypted_user, "correct horse")
    refute MybbPasswordVerifier.valid?(unknown_user, "correct horse")
  end

  private

  def legacy_user(plain_text_password)
    salt = "abc123"
    password_hash = Digest::MD5.hexdigest(
      Digest::MD5.hexdigest(salt) + Digest::MD5.hexdigest(plain_text_password)
    )

    UserPassword.new(
      password: password_hash,
      salt: salt,
      password_algorithm: "",
      password_encryption: 0
    )
  end
end
