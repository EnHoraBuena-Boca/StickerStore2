class UserCard < ApplicationRecord
  belongs_to :user
  attribute :uuid, MySQLBinUUID::Type.new
  enum :cardtype, { Bronze: 0, Silver: 1, Gold: 2, Diamond: 3}
  before_create :set_uuid
  has_many :trade_items
  
  private

  def set_uuid
    self.uuid ||= SecureRandom.uuid
  end

end
