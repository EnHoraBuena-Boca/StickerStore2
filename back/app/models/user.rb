class User < ApplicationRecord  
  enum :status, { normal: 0, moderator: 1, card_approver: 2}
  validates :first_name, presence: true, uniqueness: { case_sensitive: false }
  has_many :user_cards, dependent: :destroy
  self.primary_key = [:id]
end
