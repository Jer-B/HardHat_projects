// use:
// yarn hardhat test
// or by using --grep and a unique keyword of a it to run a specific test only instead of all
// yarn hardhat test --grep store
// or by using only keyword on it to do the same => it.only()

const { ethers } = require("hardhat")
const { expect, assert } = require("chai")

//Use Mocha framework for tests

// describe takes a name and a function as parameters.
// often function will be anonymous and can be written in multiple different way
//
/**
 *
 * function TestFunction(){
 * blablabla
 * }
 *
 * describe("SimpleStorage", Testfunction())
 *
 * which comes to doing this in an anonymous mode:
 *
 * describe("SimpleStorage", function (){})
 *
 * or
 *
 *  describe("SimpleStorage", () => { })
 *
 * which is both the same
 */

//basic test for simplestorage contract
describe("SimpleStorage", () => {
    //beforeEach it pattern
    // beforeeach will tell what to do before each it test
    // we can do nesting with another describe inside and within others beforeeach it
    //1. before any test deploy contract

    // assign variables outside the scope first
    let simpleStorageFactory, simpleStorage
    beforeEach(async function () {
        simpleStorageFactory = await ethers.getContractFactory("SimpleStorage")
        simpleStorage = await simpleStorageFactory.deploy()
    })
    // say what test to do
    it("Should start with a favorite number of 0", async function () {
        const retrieveNumber = await simpleStorage.retrieve()
        const expectedValue = "0"

        //then we can do both below keywords from chai package
        //assert
        //expect
        // there is a difference between both but assert makes more logicial sense

        // we are asserting that retrieve will return expectedvalue as 0
        assert.equal(expectedValue.toString(), expectedValue)
        console.log("Value is:", retrieveNumber.toString())
    })

    it("Should update when we call store", async function () {
        const expectedValue = "8"
        const storeNumber = await simpleStorage.store(expectedValue)
        await storeNumber.wait(1)
        const currentValue = await simpleStorage.retrieve()
        assert.equal(currentValue.toString(), expectedValue.toString())
        //expect(currentValue.toString()).to.equal(expectedValue)
    })

    it("Should return added number equal to 2", async function () {
        const expectedValue = "2"
        const getAdd = await simpleStorage.add()
        assert.equal(getAdd.toString(), expectedValue.toString())
    })

    it("Should return an array with patrick at index 0 and favoritenumber equal to 2", async function () {
        const expectedName = "patrick"
        const expectedNumber = "2"
        const getAddPeople = await simpleStorage.addPeople(
            expectedName,
            expectedNumber
        )
        await getAddPeople.wait(1)

        //get name and favorite number from index 0 of addpeople
        const { favoriteNumber, name } = await simpleStorage.people(0)
        // console.log("print number ", favoriteNumber.toString())
        // console.log("print name ", name)
        // console.log("Name and number", favoriteNumber.toString(), name)
        assert.equal(name, expectedName)
        assert.equal(favoriteNumber, expectedNumber.toString())
        // assert.deepEqual compare elements of an array
        assert.deepEqual(
            [favoriteNumber.toString(), name],
            [expectedNumber, expectedName]
        )
    })
})
