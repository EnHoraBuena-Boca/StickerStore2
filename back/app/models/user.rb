class User < ApplicationRecord  
  enum :status, { normal: 0, moderator: 1, card_approver: 2}, prefix: :status
  validates :first_name, presence: true, uniqueness: { case_sensitive: false }
  has_many :user_cards, dependent: :destroy
  has_one :availible_pack, dependent: :destroy

  has_many :trade_participants
  has_many :trades, through: :trade_participants


  self.primary_key = [:id]
  after_create :create_availible_packs
  
  private

  def create_availible_packs
    AvailiblePack.transaction do
      AvailiblePack.create!(user: self)
    end
  end
end
