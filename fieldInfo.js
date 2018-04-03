'use strict';

module.exports = (promclient, config) => {

    const request = require("request");      
    const urlGraph = "http://field.carriota.com/api/v1/graph";
    const urlSeason = "http://field.carriota.com/api/v1/seasons";
    const urlMarketcap = "https://api.coinmarketcap.com/v1/ticker/iota/";
	
	// test if config variable field_nodes_public_ids_array is empty
	let issetMultipleOwnNodesArray = false;
	if (config.field_nodes_public_ids_array.length > 0) {
		issetMultipleOwnNodesArray = true;
	}

	// test if config variable field_node_public_id is empty
	let issetOwnNodePublicId = false;
	if (typeof config.field_node_public_id !== 'undefined') {
		issetOwnNodePublicId = true;
	}
    
	// constants
    const iota2miota = 0.000001;
    const weekInSeconds = 604800000; 
    const multiplicators = {
        attachToTangle: 50,
        broadcastTransactions: 5,
        checkConsistency: 5,
        findTransactions: 5,
        getBalances: 3,
        getInclusionStates: 3,
        getNodeInfo: 1,
        getTransactionsToApprove: 3,
        getTrytes: 3,
        storeTransactions: 20,
        wereAddressesSpentFrom: 5
    };
    
	// define metrics
	
    let module = {};

    let Gauge = promclient.Gauge;
	
	// 1. Common Field Stats
	
	let fieldNodesOnline = new Gauge({
        name: 'field_nodes_online',
        help: 'TODO'
    })
	let fieldSeasonBalance = new Gauge({
        name: 'field_season_balance',
        help: 'TODO'
    })
	let fieldSeasonScore = new Gauge({
        name: 'field_season_score',
        help: 'TODO'
    })
	let fieldSeasonCompleted = new Gauge({
        name: 'field_season_completed',
        help: 'TODO'
    })
	let fieldSeasonNumberOfSeasons = new Gauge({
        name: 'field_season_number_of_seasons',
        help: 'TODO'
    })
	
	// 2. Single Node Field Stats
	
	let fieldNodeRank = new Gauge({
        name: 'field_node_rank',
        help: 'TODO'
    })
	let fieldNodeScore = new Gauge({
        name: 'field_node_score',
        help: 'TODO'
    })
	let fieldNodeBalanceIota = new Gauge({
        name: 'field_node_balance_iota',
        help: 'TODO'
    })
	let fieldNodeBalanceUsd = new Gauge({
        name: 'field_node_balance_usd',
        help: 'TODO'
    })
	let fieldNodeNr1Score = new Gauge({
        name: 'field_node_nr1_score',
        help: 'TODO'
    })
	
	// 3. Season History Field Stats
	
	let fieldNodeSeasonParticipation = new Gauge({
        name: 'field_node_season_participation',
        help: 'TODO'
    })
	let fieldNodeSeasonWorkDoneMax = new Gauge({
        name: 'field_node_season_workdonemax',
        help: 'TODO'
    })
	let fieldNodeSeasonWorkDoneMin = new Gauge({
        name: 'field_node_season_workdonemin',
        help: 'TODO'
    })
	let fieldNodeSeasonWorkDoneSum = new Gauge({
        name: 'field_node_season_workdonesum',
        help: 'TODO'
    })
	let fieldNodeSeasonWorkDoneAverage = new Gauge({
        name: 'field_node_season_workdoneaverage',
        help: 'TODO'
    })
	
	// 4. Multiple Node Field Stats
	
	let fieldMultipleNodesScore = new Gauge({
        name: 'field_multiple_nodes_score',
        help: 'TODO'
    })
	let fieldMultipleNodesScoreMax = new Gauge({
        name: 'field_multiple_nodes_score_max',
        help: 'TODO'
    })
	let fieldMultipleNodesScoreMin = new Gauge({
        name: 'field_multiple_nodes_score_min',
        help: 'TODO'
    })
	let fieldMultipleNodesScoreAverage = new Gauge({
        name: 'field_multiple_nodes_score_average',
        help: 'TODO'
    })
	let fieldMultipleNodesNumber = new Gauge({
        name: 'field_multiple_nodes_number',
        help: 'TODO'
    })
	let fieldMultipleNodesBalanceIota = new Gauge({
        name: 'field_multiple_nodes_balance_iota',
        help: 'TODO'
    })
	let fieldMultipleNodesBalanceUsd = new Gauge({
        name: 'field_multiple_nodes_balance_usd',
        help: 'TODO'
    })
	
	// functions
 
	// calculate score by computing sum of workDone * multiplicator
    function calculateScore(workSet, key) {
        if (!workSet[key]) {
            return 0;
        }

        const Score = workSet[key] * multiplicators[key];

        return Score;
    }
    
	// get rank of a single node
    function getNodeRank(nodes, ownScore) {
        let arrayNodeRank = [];
        let rankNr = 0;
        
        // compute the score for each node
        nodes.forEach((node) => {
            arrayNodeRank.push(getNodeScore(node));
        });
        
        //sort array descending
        arrayNodeRank.sort(function(a, b){return b-a});
        
        // compute rank for node
        for (let i = 0; i < arrayNodeRank.length; i++) {
            if((arrayNodeRank[i] == ownScore) && (rankNr == 0)) {
                rankNr = i+1;
			}
        }
        return rankNr;
    }
	
	// get score of leading node
	function getNr1NodeScore(nodes) {
        let arrayNodeRank = [];
        
        // compute the score for each node
        nodes.forEach((node) => {
            arrayNodeRank.push(getNodeScore(node));
        });
        
        //sort array descending
        arrayNodeRank.sort(function(a, b){return b-a});
        
        return arrayNodeRank[0];
    }

	// get score of a single node
    function getNodeScore(node) {
        let Score = 0;
        
        Object.keys(multiplicators)
            .forEach(key => {
                Score += calculateScore(node.workDone, key);
            });

        return Score;
    }

	// get score(sum) or all online field nodes
    function getallNodesScore(nodes) {
        let allNodesScore = 0;
        
        nodes.forEach((node) => {
                allNodesScore += getNodeScore(node);
        });

        return allNodesScore;
    }
	
	// get number of involved seasons of a single node
	function getNodeSeasonParticipation(seasons) {
        let nodeSeasonParticipation = 0;
        
        seasons.forEach((season) => {
			season.payouts.forEach((payout) => {
				if(payout.publicId == config.field_node_public_id) {
					nodeSeasonParticipation += 1;
				}
			});
        });

        return nodeSeasonParticipation;
    }
	
	// get array of workDone of a single node over all seasons
	function getNodeSeasonWorkDone(seasons) {
        let counter = 0;
		let arrayWorkDone = [];
        
        seasons.forEach((season) => {
			season.payouts.forEach((payout) => {
				if(payout.publicId == config.field_node_public_id) {
					arrayWorkDone[counter] = payout.score;
					counter++;
				}
			});
        });

        return arrayWorkDone;
    }
	
	// compute the sum of the scores for all own node
	function getOwnNodesScoreSum(nodes, ownNodesPublicIds) {
		let scoreSum = 0;
		
		nodes.forEach((node) => {
			ownNodesPublicIds.forEach((ownNode) => {
				if(node.field.publicId == ownNode) {
					scoreSum += getNodeScore(node);
				}
			});
		});
		return scoreSum;
	}
	
	// get array of ranks of all own nodes
	function getOwnNodesRankArray(allNodes, ownNodesPublicIds) {
		let counter = 0;
		let arrayNodeRank = [];
		allNodes.forEach((node) => {
			ownNodesPublicIds.forEach((ownNode) => {
				if(node.field.publicId == ownNode) {
					arrayNodeRank[counter] = getNodeRank(allNodes, getNodeScore(node));
					counter++;
				}
			});
		});
		return arrayNodeRank;
	}

    module.getFieldInfo = async () => {

        try {
            // call marketcap api
            let marketcapResponse = await new Promise(function (resolve, reject) {
            request({
                url: urlMarketcap,
                json: true,
            }, (err, response, body) =>  {
                if (err || response.statusCode !== 200) {
					console.log('marketcapResponse error: '+ err.message);
                    reject(err)
                } else {
                    resolve(body);
                }
            })})
            
			// get IOTA price in dollar
            let iotaPrice = marketcapResponse[0].price_usd;           

			// call season api  
			let seasonResponse = await new Promise(function (resolve, reject) {
			request({
				url: urlSeason,
				json: true,
			}, (err, response, body) =>  {
				if (err || response.statusCode !== 200) {
					console.log('seasonResponse error: '+ err.message);
					reject(err)
				} else {
					resolve(body);
				}
			})})
			
			let season = seasonResponse[0];
			
			// IOTA donated current season
			let seasonBalance = season.balance;
			fieldSeasonBalance.set(seasonBalance);
			
			// number of seasons so far
			let seasonNumber = seasonResponse.length;
			fieldSeasonNumberOfSeasons.set(seasonNumber);

			// season progress
			let completed = (((Date.now() - Date.parse(season.createdOn)) / weekInSeconds)*100).toFixed(2); 
			fieldSeasonCompleted.set(parseFloat(completed)); 

			if (issetOwnNodePublicId == true) {
				
				// number of participated seasns
				let nodeParticipation = getNodeSeasonParticipation(seasonResponse);
				fieldNodeSeasonParticipation.set(nodeParticipation);	

				// compute highest, lowest, average, sum of scores over all participated seasons
				let workDoneArray = getNodeSeasonWorkDone(seasonResponse);
				
				let workDoneMax = Math.max.apply(Math, workDoneArray);
				fieldNodeSeasonWorkDoneMax.set(workDoneMax);
				
				let workDoneMin = Math.min.apply(Math, workDoneArray);
				fieldNodeSeasonWorkDoneMin.set(workDoneMin);
				let workDoneSum = 0;
				for( var i = 0; i < workDoneArray.length; i++ ){
					workDoneSum += workDoneArray[i];
				}
				fieldNodeSeasonWorkDoneSum.set(workDoneSum);
				
				let workDoneAverage = parseInt((workDoneSum/workDoneArray.length));
				fieldNodeSeasonWorkDoneAverage.set(workDoneAverage);			
			}
			
            // call graph api 
            let graphResponse = await new Promise(function (resolve, reject) {
                request({
                    url: urlGraph,
                    json: true,
                }, (err, response, body) =>  {
                    if (err || response.statusCode !== 200) {
                        console.log('graphResponse error: '+ err.message);
                        reject(err);
                } else {
                    resolve(body);
                }
            })})
			
			// get number of fieldnodes online
			fieldNodesOnline.set(graphResponse.length);
	
			// get sum of workDone of all online nodes
			let allNodesScore = getallNodesScore (graphResponse);
			fieldSeasonScore.set(allNodesScore);
			
			// get score of leading node
			let nodeScoreNr1 = getNr1NodeScore(graphResponse); 
			fieldNodeNr1Score.set(nodeScoreNr1);
			
			if (issetOwnNodePublicId == true) {
				
				// get own node from graphResponse      
				let node = graphResponse.filter(
					(it) => {
						return it.field.publicId === config.field_node_public_id; 
					}
				)  
				node=node[0];

				// get score of own node
				let nodeScore = getNodeScore(node); 
				fieldNodeScore.set(nodeScore); 
				
				// get balance in iota of own node
				let nodeBalance = ((nodeScore / allNodesScore) * seasonBalance).toFixed(0);
				fieldNodeBalanceIota.set(parseInt(nodeBalance));
				
				// get balance in dollar of own node
				let nodeBalanceUsd = ((nodeBalance * iota2miota) * iotaPrice).toFixed(2); 
				fieldNodeBalanceUsd.set(parseFloat(nodeBalanceUsd));
	 
				// get rank of own node
				let rank = getNodeRank(graphResponse,nodeScore);     
				fieldNodeRank.set(rank);
			}
			
			if (issetMultipleOwnNodesArray == true) {
			
				// calculate score for all own nodes
				let multipleNodesScore = getOwnNodesScoreSum(graphResponse, config.field_nodes_public_ids_array);
				fieldMultipleNodesScore.set(multipleNodesScore);

				// get ranks of all own nodes (max, min, average)
				let ownNodesRankArray = getOwnNodesRankArray(graphResponse, config.field_nodes_public_ids_array);
				
				let ownNodesRankMax = Math.max.apply(Math, ownNodesRankArray);
				fieldMultipleNodesScoreMax.set(ownNodesRankMax);
				
				let ownNodesRankMin = Math.min.apply(Math, ownNodesRankArray);
				fieldMultipleNodesScoreMin.set(ownNodesRankMin);
				
				let ownNodesRankSum = 0;
				for( var i = 0; i < ownNodesRankArray.length; i++ ){
					ownNodesRankSum += ownNodesRankArray[i];
				}
				
				let ownNodesRankAverage = parseInt((ownNodesRankSum/ownNodesRankArray.length));
				fieldMultipleNodesScoreAverage.set(ownNodesRankAverage);
				
				// get number of own nodes
				fieldMultipleNodesNumber.set(config.field_nodes_public_ids_array.length);
				
				// calculate node balance of all nodes in iota
				let ownNodesBalanceIota = ((multipleNodesScore / allNodesScore) * seasonBalance).toFixed(0);
				fieldMultipleNodesBalanceIota.set(parseInt(ownNodesBalanceIota));
				
				// calculate nod balance of all nodes in usd
				let ownNodesBalanceUsd = ((ownNodesBalanceIota * iota2miota) * iotaPrice).toFixed(2); 
				fieldMultipleNodesBalanceUsd.set(parseFloat(ownNodesBalanceUsd));			
			}

            return ('getFieldInfo ran as expected');
        } catch (e) {
            console.log(e.message);
            return e;
        }
    }
    return module;
}

