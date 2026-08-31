class User < ApplicationRecord  
  enum :status, { normal: 0, moderator: 1, card_approver: 2}, prefix: :status
  validates :username, presence: true, uniqueness: { case_sensitive: false }
  has_many :user_cards, dependent: :destroy

  has_many :trade_participants
  has_many :trades, through: :trade_participants

  def self.authenticate_with_mybb(username, password)
    mybb_user = MybbUser.find_by(username: username.to_s)
    return unless mybb_user&.authenticates_password?(password)

    find_or_create_by!(username: mybb_user.username)
  end
end
