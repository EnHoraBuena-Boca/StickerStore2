class UserCard < ApplicationRecord
  belongs_to :user
  attribute :uuid, MySQLBinUUID::Type.new
  enum :cardtype, { Common: 0, Uncommon: 1, Rare: 2}
  before_create :set_uuid
  
  private

  def set_uuid
    self.uuid ||= SecureRandom.uuid
  end

end
