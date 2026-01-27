class OriginalCard < ApplicationRecord
  enum :cardtype, { Bronze: 0, Silver: 1, Gold: 2, Diamond: 3}

end
