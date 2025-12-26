class OriginalCard < ApplicationRecord
  enum :Cardtype, { Common: 0, Uncommon: 1, Rare: 2}

end
