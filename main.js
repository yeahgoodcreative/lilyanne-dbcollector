
// Modules
var byDesign = require('./modules/bydesign')
var mongoose = require('mongoose')
var fs = require('fs')


// Modeles
var Order = require('./models/order')

// Mongoose Connection
var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/lilyanneintegration', {useNewUrlParser: true, authSource: 'admin', user: 'yeahgood', pass: 'beginnings01'})

// Get database from connection
var db = mongoose.connection

// Check for connection erros
db.on('error', console.error.bind(console, 'Connection error:'))

// Connection established
db.once('open', function() {

    // Create a timer
    setInterval(cloneByDesignDB, 60000)
})

function cloneByDesignDB() {
    // Debug
    console.log('[INFO] Cloning ByDesign DB')

    // Order promises array
    var orderPromises = []

    // Order list recent promise
    var orderListRecentPromise = new Promise(function(resolve, reject) {

        // Get order list recent
        byDesign.getOrderListRecent('', 'week', 1, 'false', function(orderListRecent) {

            // Focus in on orderListRecent
            orderListRecent = orderListRecent['soap:Envelope']['soap:Body'][0]['GetOrderListRecentResponse'][0]['GetOrderListRecentResult'][0]['OrderList']

            // Resolve orderListRecent
            resolve(orderListRecent)
        })
    })

    orderListRecentPromise.then(function(orderListRecent) {

        // Iterate through recent orders
        for (orderRecent of orderListRecent) {

            var orderPromise = new Promise(function(resolve, reject) {

                var orderId = ''
                var dateCreated = ''
                var dateModified = ''

                // Check values exist
                if (orderRecent['OrderID'])
                    orderId = orderRecent['OrderID'][0]

                if (orderRecent['CreatedDate'])

                    dateCreated = orderRecent['CreatedDate'][0]

                if (orderRecent['LastModifiedDate'])
                    dateModified = orderRecent['LastModifiedDate'][0]

                // Order info promise
                var orderInfoPromise = new Promise(function(resolve, reject) {

                    byDesign.getOrderInfoV2('', orderId, function(orderInfo) {
                        orderInfo = orderInfo['soap:Envelope']['soap:Body'][0]['GetOrderInfo_V2Response'][0]['GetOrderInfo_V2Result'][0]
                    
                        // Create a current order object
                        var currentOrderInfo = {
                            repNumber: orderInfo.RepNumber[0],
                            customerNumber: function () {
                                if (orderInfo.CustomerNumber)
                                    return orderInfo.CustomerNumber[0]
                                else
                                    return ''
                            },
                            status: orderInfo.Status[0],
                            orderDate: orderInfo.OrderDate[0],
                            billName1: orderInfo.BillName1[0],
                            billName2: orderInfo.BillName1[0],
                            billStreet1: orderInfo.BillStreet1[0],
                            billStreet2: orderInfo.BillStreet1[0],
                            billCity: orderInfo.BillCity[0],
                            billState: orderInfo.BillState[0],
                            billPostalCode: orderInfo.BillPostalCode[0],
                            billCountry: orderInfo.BillCountry[0],
                            billEmail: orderInfo.BillEmail[0],
                            billPhone: orderInfo.BillPhone[0],
                            shipName1: orderInfo.ShipName1[0],
                            shipName2: orderInfo.ShipName2[0],
                            shipStreet1: orderInfo.ShipStreet1[0],
                            shipStreet2: orderInfo.ShipStreet2[0],
                            shipCity: orderInfo.ShipCity[0],
                            shipState: orderInfo.ShipState[0],
                            shipPostalCode: orderInfo.ShipPostalCode[0],
                            shipGeoCode: orderInfo.ShipGeoCode[0],
                            shipCountry: orderInfo.ShipCountry[0],
                            shipEmail: orderInfo.ShipEmail[0],
                            shipPhone: orderInfo.ShipPhone[0],
                            invoiceNotes: orderInfo.InvoiceNotes[0],
                            shipMethodId: orderInfo.ShipMethodID[0],
                            shipMethod: orderInfo.ShipMethod[0],
                            rankPriceType: orderInfo.RankPriceType[0],
                            partyId: orderInfo.PartyID[0],
                            currencyTypeId: orderInfo.CurrencyTypeID[0],
                            giftOrder: orderInfo.GiftOrder[0],
                            alternateShipMethodId: orderInfo.AlternateShipMethodID[0]
                        }
            
                        // Resolve promise with orderInfo
                        resolve(currentOrderInfo)
                    })
                })

                // Order detail info promise
                var orderDetailInfoPromise = new Promise(function(resolve, reject) {
                    byDesign.getOrderDetailsInfoV2('', orderId, function(orderDetailsInfo) {
                        orderDetailsInfo = orderDetailsInfo['soap:Envelope']['soap:Body'][0]['GetOrderDetailsInfo_V2Response'][0]['GetOrderDetailsInfo_V2Result'][0]['OrderDetailsResponse'][0]['OrderDetailsResponseV2']
                    
                        // Array to hold details
                        var orderDetailsInfoArray = []
                    
                        // Iterate through each order detail
                        if (orderDetailsInfo) {
                            for (detailInfo of orderDetailsInfo) {
                                var detailInfoObject = {
                                    partyId: detailInfo.PartyID[0],
                                    orderDetailId: detailInfo.OrderDetailID[0],
                                    productId: detailInfo.ProductID[0],
                                    description: detailInfo.Description[0],
                                    quantity: detailInfo.Quantity[0],
                                    price: detailInfo.Price[0],
                                    volume: detailInfo.Volume[0],
                                    tax: detailInfo.Tax[0],
                                    taxableAmount: detailInfo.TaxableAmount[0],
                                    groupOwner: detailInfo.GroupOwner[0],
                                    parentOrderDetailId: detailInfo.ParentOrderDetailID[0],
                                    warehouseName: detailInfo.WarehouseName[0],
                                    warehouseEmail: detailInfo.WarehouseEmail[0],
                                    warehousePackSlipLine1: detailInfo.WarehousePackSlipLine1[0],
                                    warehousePackSlipLine2: detailInfo.WarehousePackSlipLine2[0],
                                    warehousePackSlipLine3: detailInfo.WarehousePackSlipLine3[0],
                                    warehousePackSlipLine4: detailInfo.WarehousePackSlipLine4[0],
                                    warehousePackSlipLine5: detailInfo.WarehousePackSlipLine5[0],
                                    warehousePackSlipLine6: detailInfo.WarehousePackSlipLine6[0],
                                    warehousePickupLocation: detailInfo.WarehousePickupLocation[0],
                                    warehouseCompanyTaxId: detailInfo.WarehouseCompanyTaxID[0],
                                    warehouseIntlCompanyName: detailInfo.WarehouseIntlCompanyName[0],
                                    warehousePackSlipTaxTitle: detailInfo.WarehousePackSlipTaxTitle[0],
                                    warehousePackSlipTaxPercentage: detailInfo.WarehousePackSlipTaxPercentage[0],
                                    packSlipProcessId: detailInfo.PackSlipProcessID[0],
                                    volume2: detailInfo.Volume2[0],
                                    volume3: detailInfo.Volume3[0],
                                    volume4: detailInfo.Volume4[0],
                                    otherPrice1: detailInfo.OtherPrice1[0],
                                    otherPrice2: detailInfo.OtherPrice2[0],
                                    otherPrice3: detailInfo.OtherPrice3[0],
                                    otherPrice4: detailInfo.OtherPrice4[0],
                                    packSlipProductId: detailInfo.PackSlipProductID[0],
                                    packSlipBarcode: detailInfo.PackSlipBarcode[0]
                                }
                
                                // Add object to array
                                orderDetailsInfoArray.push(detailInfoObject)
                            }
                        }
            
                        // Resolve promise with orderDetailsInfoArray
                        resolve(orderDetailsInfoArray)
                    })
                })

                // Collect promises
                Promise.all([orderInfoPromise, orderDetailInfoPromise]).then(function(results) {

                    // Create order promises containing previous promises
                    resolve({
                        orderId: orderId,
                        dateCreated: dateCreated,
                        dateModified: dateModified,
                        orderInfo: results[0],
                        orderDetailsInfo: results[1]
                    })
                })
            })

            // Push promise to array
            orderPromises.push(orderPromise)
        }

        // Collect order promises
        Promise.all(orderPromises).then(function(results) {
            // Iterate through results
            for (result of results) {
                // Save order object in database
                Order.findOneAndUpdate({orderId: result.orderId}, result, {upsert: true}, function(err, order) {
                    // Log Error
                    if (err) {
                        console.log('[ERROR] ' + err)
                    }
                })
            }
            
        })
    })
}