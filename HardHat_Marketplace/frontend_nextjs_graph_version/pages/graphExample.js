import { useQuery, gql } from "@apollo/client";

// create a new query, similar to the graph playground
// just get active items though it
const GET_ACTIVE_ITEMS = gql`
  {
    activeItems(
      first: 5
      where: { buyer: "0x0000000000000000000000000000000000000000" }
    ) {
      id
      buyer
      seller
      nftAddress
      tokenId
      price
    }
  }
`;

export default function GraphExample() {
  //pass the querry to apollo
  const { loading, data, error } = useQuery(GET_ACTIVE_ITEMS);
  // return a div from result
  console.log(data);
  return <div>hi</div>;
}
