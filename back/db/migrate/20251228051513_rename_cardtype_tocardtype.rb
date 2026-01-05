class RenameCardtypeTocardtype < ActiveRecord::Migration[8.0]
  def change
      rename_column :original_cards, :Cardtype, :cardtype
  end
end
