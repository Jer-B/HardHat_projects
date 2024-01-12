import { BigInt, Address } from "@graphprotocol/graph-ts";
import {
  ItemBought as ItemBoughtEvent,
  ItemCanceled as ItemCanceledEvent,
  ItemListed as ItemListedEvent,
} from "../generated/NftMarketplace/NftMarketplace";
import {
  ItemBought,
  ItemCanceled,
  ItemListed,
  ActiveItem,
} from "../generated/schema";

export function handleItemBought(event: ItemBoughtEvent): void {
  // Needs
  // ItemBoughtEvent, which will be the raw event to use
  // ItemBoughtObject, which will serve to save the event
  let itemBought = ItemBought.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );

  // everytime we list an item, we also list an activeItem which serves to do transition between what it handles
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  //if no itemBought existing, create a new one
  if (!itemBought) {
    itemBought = new ItemBought(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }
  itemBought.buyer = event.params.buyer;
  itemBought.nftAddress = event.params.nftAddress;
  itemBought.tokenId = event.params.tokenId;
  itemBought.price = event.params.price;

  // we just need to update the buyer on the active item
  // "!" in ts means, required to have
  // which will serve to say if activeItem as a buyer it has been bought
  // else still on the market
  activeItem!.buyer = event.params.buyer;

  // commented in schema.graphql
  //itemBought.blockNumber = event.block.number;
  //itemBought.blockTimestamp = event.block.timestamp;
  //itemBought.transactionHash = event.transaction.hash;

  itemBought.save();
  activeItem!.save();
}

export function handleItemCanceled(event: ItemCanceledEvent): void {
  let itemCanceled = ItemCanceled.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  if (!itemCanceled) {
    itemCanceled = new ItemCanceled(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }
  itemCanceled.seller = event.params.seller;
  itemCanceled.nftAddress = event.params.nftAddress;
  itemCanceled.tokenId = event.params.tokenId;

  //update the buyer of activeItem, by the dead address -> 0x00000...
  // if an active item as the dead address as buyer, it means it has been canceled
  activeItem!.buyer = Address.fromString(
    "0x000000000000000000000000000000000000dEaD"
  );
  // commented in schema.graphql
  //entity.blockNumber = event.block.number;
  //entity.blockTimestamp = event.block.timestamp;
  //entity.transactionHash = event.transaction.hash;

  itemCanceled.save();
  activeItem!.save();
}

export function handleItemListed(event: ItemListedEvent): void {
  let itemListed = ItemListed.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  let activeItem = ActiveItem.load(
    getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
  );
  //if no itemBought existing, create a new one
  if (!itemListed) {
    itemListed = new ItemListed(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }
  // if it is a new item which is listed, activeItem won't already exist, we need to create one if it is the case
  if (!activeItem) {
    activeItem = new ActiveItem(
      getIdFromEventParams(event.params.tokenId, event.params.nftAddress)
    );
  }

  //update parameters of items
  itemListed.seller = event.params.seller;
  itemListed.nftAddress = event.params.nftAddress;
  itemListed.tokenId = event.params.tokenId;
  itemListed.price = event.params.price;

  // activeItem needs full params at listing
  activeItem.seller = event.params.seller;
  activeItem.nftAddress = event.params.nftAddress;
  activeItem.tokenId = event.params.tokenId;
  activeItem.price = event.params.price;
  // commented in schema.graphql
  //entity.blockNumber = event.block.number;
  //entity.blockTimestamp = event.block.timestamp;
  //entity.transactionHash = event.transaction.hash;

  itemListed.save();
  activeItem.save();
}

// in TS we need to define the type of the input parameters
// (tokensId:BigInt)
// and the return type
// : string
// for BigInt and Address it is special types from the graph and string from TS
// so they need to be imported at top
function getIdFromEventParams(tokenId: BigInt, nftAddress: Address): string {
  return tokenId.toHexString() + nftAddress.toHexString();
}
