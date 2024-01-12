//hardhat-deploy still needs to have dependencies imported
// doesnt need main function
// doesnt need to call main function
// works a bit differently
// its actually gonna call a function that we specify, deployFunc.
// and make it a default function for hardhat-deploy to look for

// passing hardhat runtime environment as argument to this function -> hre
// code example:
/*
import {HardhatRuntimeEnvironment} from 'hardhat/types';
import {DeployFunction} from 'hardhat-deploy/types';

const func: DeployFunction = async function (hre: HardhatRuntimeEnvironment) {
  // code here
};
export default func;
*/

// the true necessary syntax is a quiet different, see documentation
// https://github.com/wighawag/hardhat-deploy#deploy-scripts
