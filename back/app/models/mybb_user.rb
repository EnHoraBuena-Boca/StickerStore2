class MybbUser < ApplicationRecord
  database_name = ENV.fetch("MYBB_DATABASE", "mybbdb")
  unless database_name.match?(/\A[a-zA-Z0-9_]+\z/)
    raise ArgumentError, "MYBB_DATABASE may only contain letters, numbers, and underscores"
  end

  self.table_name = "#{database_name}.mybb_users"
  self.primary_key = "uid"

  def authenticates_password?(plain_text_password)
    MybbPasswordVerifier.valid?(self, plain_text_password)
  end
end
