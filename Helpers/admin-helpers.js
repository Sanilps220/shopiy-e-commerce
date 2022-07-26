var db = require('../config/connection')
let collection = require('../config/collections')
const { resolve, reject } = require('promise')
const { response } = require('../app')
let objectId = require('mongodb').ObjectId


module.exports = {

    verify:()=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.toString("admin"))
            .find({"admin":{ $exists: true}})
            console.log(response);
            resolve(response)
           
        })
    },
    verifyLogIn:()=>{
        return new Promise(async(resolve,reject)=>{
            db.get().collection(collection.admin).InsertOne({
                "_id":objectId(123),
                "admin":true
            })
            resolve()
        })

        },

    getBrand:()=>{
        return new Promise(async(resolve,reject)=>{
        let allBrand=await db.get().collection(collection.BRAND_COLLECTION).find({})
            .toArray()
          resolve(allBrand)
        })
    },
    blockUser:(userId)=>{
        console.log("db blocked");
        return new Promise((resolve,reject)=>{
             db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id:objectId(userId)},{$set:{userBlocked: true}})
            .then((data)=> {                
                resolve(data)
                })
        })
    },
    removeUser:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION)
            .deleteOne(
            {_id:objectId(id)}
        )    
        resolve()         
        })
    },
    unblockUser:(userId)=>{
        console.log("db unblock");
        console.log(userId);
        return new Promise((resolve,reject)=>{
             db.get().collection(collection.USER_COLLECTION)
            .updateOne({_id:objectId(userId)},{$set:{userBlocked: false}})
            .then((data)=> {  
             resolve(data)
            })
        })
    },
    viewPass:(id)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION)
            .findOne({
                _id:objectId(id)
            }).then((response)=>{
               // bcrypt(response.Pass) 
            console.log(response)
            resolve(response)
            })
        })
    },
    getCount:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).count()
            .then((data)=>{
                 resolve(data)
            })
          
        })
    },
    getActiveCount:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.USER_COLLECTION).find({userBlocked:false}).count()
            .then((data)=>{
                resolve(data)
           })   
        })
    },
    getProductCount:()=>{
        return new Promise(async(resolve,reject)=>{
            let totalProducts = await db.get().collection(collection.PRODUCT_COLLECTION).aggregate([
                {
                    "$unwind":"$productVariants"
                },
                {
                    "$count":"productQuantity"
                }
            ])
                .toArray()
                resolve(totalProducts[0]?.productQuantity) 
            
        })
    },
    getOrderCount:()=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.ORDER_COLLECCTION).count()
            .then((data)=>{
                resolve(data) 
           })   
        })
    },
    getItemsCount:(obje)=>{
         ob = ""+obje
         console.log(ob);
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).find({"details":ob}).count()
            .then((data)=>{
                console.log(ob+" "+data);
                resolve(data)
              
           })   
        }) 
    },
    getGendCount:(gend)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.PRODUCT_COLLECTION).find({"category":gend}).count()
            .then((data)=>{
                resolve(data) 
                console.log(data+""+gend);
           })   
        })
    },
    getStockOut:()=>{
        return new Promise(async(resolve,reject)=>{
            let stock = await db.get().collection(collection.PRODUCT_COLLECTION)
            .aggregate([
                {
                "$unwind":"$productVariants"
                },
                {
                    $project:{
                        name:"$name",
                        quantity: "$productVariants.productQuantity"
                    }
                },
                {
                    $group:{
                        _id:"$name",
                        stock:{
                            $sum:"$quantity"
                        },
                    }
                },
                {
                    $sort:{stock:1},
                },
                {
                    $match:{stock:{
                        $lte:30
                    }}
                }
            ]).toArray()
            console.log(stock);
            resolve(stock)
        })
    },
    cancelOrder:(orderId)=>{
        console.log(orderId);
        return new Promise((resolve,reject)=>{
           db.get().collection(collection.ORDER_COLLECCTION)
            .updateOne({"_id":objectId(orderId)},
             {
                $set:{
                    OrderStatus:true,"orderObj.status": "cancelled",cancelStatus:true,status:"  -  "
                }
            }); 
            resolve();
        })
    },
    addCoupon:(coup)=>{
        return new Promise((resolve,reject)=>{
            db.get().collection(collection.COUPON_COLLECTION)
            .insertOne({
                couponCode:coup.couponCode,
                offer:coup.Offer
            })
            resolve()
        })
    },
    getRevanue:()=>{
        return new Promise(async(resolve,reject)=>{
            let revenue = await db.get().collection(collection.ORDER_COLLECCTION)
            .aggregate([ { $match: { "orderObj.status": "Delivered" } }, { $project: { total: "$orderObj.totalAmount" } }, { $project: { total: 1, _id: 0 } },{$group:{_id:null,totalRevenue:{$sum:"$total"}}} ])
            .toArray()
            resolve(revenue[0]?.totalRevenue)
        })
    }
}