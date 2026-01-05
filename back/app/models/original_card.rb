class OriginalCard < ApplicationRecord
  enum :cardtype, { Common: 0, Uncommon: 1, Rare: 2}

end
