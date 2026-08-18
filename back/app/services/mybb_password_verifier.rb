require "bcrypt"
require "digest/md5"

class MybbPasswordVerifier
  BCRYPT_PREFIX = /\A\$2[abxy]\$/
  LEGACY_ALGORITHMS = ["", "mybb"].freeze

  def self.valid?(user, plain_text_password)
    return false if plain_text_password.blank? || user.password.blank?
    return false if user.password_encryption.to_i != 0

    password_hash = user.password.to_s
    algorithm = user.password_algorithm.to_s.downcase

    if algorithm == "bcrypt" || password_hash.match?(BCRYPT_PREFIX)
      BCrypt::Password.new(password_hash).is_password?(plain_text_password.to_s)
    elsif LEGACY_ALGORITHMS.include?(algorithm)
      legacy_hash = Digest::MD5.hexdigest(
        Digest::MD5.hexdigest(user.salt.to_s) + Digest::MD5.hexdigest(plain_text_password.to_s)
      )
      secure_compare(legacy_hash, password_hash.downcase)
    else
      false
    end
  rescue BCrypt::Errors::InvalidHash
    false
  end

  def self.secure_compare(calculated, stored)
    calculated.bytesize == stored.bytesize &&
      ActiveSupport::SecurityUtils.secure_compare(calculated, stored)
  end
  private_class_method :secure_compare
end
