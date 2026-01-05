class PackCreation

  def pack_rarities
    pack = Array.new
    for index in 0..4
      rarity = rand(101)
      if rarity >= 95
        pack.insert(index, 2)
      elsif rarity <95 && rarity >=70
        pack.insert(index, 1)
      else
        pack.insert(index, 0)
      end
    end
    return pack
  end

  def pack_cards
    pack = pack_rarities
    cards = Array.new
    for rarity in pack
      card = OriginalCard.where(cardtype: rarity).sample
      cards.append(card)
    end
    return cards
  end


end