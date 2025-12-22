class User < ApplicationRecord
  enum :status, { normal: 0, moderator: 1, card_aprover: 2}
end
