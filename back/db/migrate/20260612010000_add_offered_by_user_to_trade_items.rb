class AddOfferedByUserToTradeItems < ActiveRecord::Migration[8.0]
  class MigrationTrade < ActiveRecord::Base
    self.table_name = "trades"

    has_many :migration_trade_participants,
      class_name: "AddOfferedByUserToTradeItems::MigrationTradeParticipant",
      foreign_key: :trade_id
    has_many :migration_trade_items,
      class_name: "AddOfferedByUserToTradeItems::MigrationTradeItem",
      foreign_key: :trade_id
  end

  class MigrationTradeParticipant < ActiveRecord::Base
    self.table_name = "trade_participants"
  end

  class MigrationTradeItem < ActiveRecord::Base
    self.table_name = "trade_items"
  end

  class MigrationUserCard < ActiveRecord::Base
    self.table_name = "user_cards"
    self.primary_key = "uuid"
  end

  def up
    add_column :trade_items, :offered_by_user_id, :bigint
    add_index :trade_items, :offered_by_user_id

    MigrationTrade.reset_column_information
    MigrationTradeItem.reset_column_information

    MigrationTrade.includes(:migration_trade_participants, :migration_trade_items).find_each do |trade|
      participant_ids = trade.migration_trade_participants.map(&:user_id)

      trade.migration_trade_items.each do |item|
        current_owner_id = MigrationUserCard.where(uuid: item.user_card_id).pick(:user_id)
        offered_by_user_id = if trade.status == 1
          participant_ids.find { |user_id| user_id != current_owner_id }
        else
          current_owner_id
        end

        item.update_columns(offered_by_user_id: offered_by_user_id) if offered_by_user_id
      end
    end
  end

  def down
    remove_index :trade_items, :offered_by_user_id
    remove_column :trade_items, :offered_by_user_id
  end
end
