
const oracledb = require('oracledb');
const dbConfig = require('../dbconfig.js');
const log4js = require('Log4js');

// App settings

const MODULE = 'dutydata';
const logger = require('../configurelogger').logger(MODULE);
const legalitywindow = `28`;
// const { traceLogConfig } = require('../app-settings').log4js;
// // Logger configuration
// log4js.configure(traceLogConfig);

// // Create the logger
// const logger = log4js.getLogger(MODULE);

exports.run = async (querystring, cb) => {
    let connection;
    try {

        let sql, binds, options, result;
        connection = await oracledb.getConnection(dbConfig);

        // const fn =
        //     `begin
        // proc_pay('`+ staff + `');
        // end;`;

        // logger.debug(fn);
        //
        // Query the data
        //
        logger.debug("Query Strings in Duty");
        logger.debug(querystring);

        var dutyseqnum = '';
        var seriesnum = '';
        Object.keys(querystring).map((obj, i) => {
            // logger.debug(obj);
            if (Object.values(querystring)[i] != 'undefined' & Object.values(querystring)[i] != '') {
                console.log('value exists ' + Object.values(querystring)[i])
                if (obj === 'dutyseqnum') {
                    dutyseqnum = ` and duty_seq_num=` + Object.values(querystring)[i];
                }
                else if (obj === 'seriesnum') {
                    seriesnum = ` and series_num=` + Object.values(querystring)[i];
                }
            }
            else {
                console.log('value UNDEFINED')
            }
        });
        logger.debug("Query dutyseqnum Clause in Duty" + dutyseqnum);
        logger.debug("Query seriesnum Clause in Duty" + seriesnum);


        sql = `SELECT to_char(D.ACT_STR_DT_TM_GMT,'HH24:MI') "sectorstart",
        to_char(D.ACT_END_DT_TM_GMT,'HH24:MI') "sectorend",
        D.ARLN_CD || ' ' || D.FLT_NUM "flight",
        d.duty_cd "dutycd",
        D.ACT_PORT_A || '-' || D.ACT_PORT_B "sector"
        FROM duty_prd_seg_v d
        WHERE d.delete_ind = 'N'`
            + dutyseqnum + seriesnum +
            ` ORDER BY d.item_seq_num`;

        binds = {};

        // For a complete list of options see the documentation.
        options = {
            outFormat: oracledb.OUT_FORMAT_OBJECT, // query result format
            // extendedMetaData: true,               // get extra metadata
            // prefetchRows:     100,                // internal buffer allocation size for tuning
            // fetchArraySize:   100                 // internal buffer allocation size for tuning
        };

        // result = await connection.executeMany(sql, binds, options);

        // await connection.execute(fn);
        // result = await connection.execute(
        //     sql,
        //     { ret: { dir: oracledb.BIND_OUT, type: oracledb.STRING } });

        console.log(sql);
        // execprocedure = await connection.execute(fn);
        if (dutyseqnum && seriesnum) {
            execprocedure = true;
        }
        else {
            execprocedure = false;
        }


        if (execprocedure) {
            result = await connection.execute(sql, binds, options);
            if (result) {
                logger.debug('SQL executed in Duty :');
                logger.debug(sql);
                logger.debug("Query results Oracle Duty: ");
                // console.dir(result, {
                //     depth: null
                // });
                console.dir(result.rows.length + ' rows retrieved ', {
                    depth: null
                });
                logger.info(result.rows.length + ' rows retrieved ')

                // console.log(result.rows)
                // const rows = result.rows.map(
                //     (duty) => (
                //         [
                //             duty.staff,
                //             duty.seriesnum,
                //             duty.legal,
                //             'Max:' + duty.maxfdp + ' Act:' + duty.actfdp,
                //             new Date(Date.parse(duty.signonbne)),
                //             new Date(Date.parse(duty.signoffbne))
                //         ]
                //     )
                // )

                cb(result.rows);
            }
        }
        else {
            console.error('Error in Values Passed, missing Series or Dutyseqnum');
            logger.error('Error in Values Passed, missing Series or Dutyseqnum');
            cb([{ 'Error': 'Error in Values Passed, missing Series or Dutyseqnum' }]);
        }
        // cb(result.rows);
        // return result.rows;

    } catch (err) {
        console.error('Error in oracle modal gantt 1');
        console.error(err);
        logger.error('Error in oracle modal gantt 1');
        logger.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
                logger.debug('closed Oracle connection gantt')
            } catch (err) {
                console.error('Error in oracle modal gantt 2');
                console.error(err);
                logger.error('Error in oracle modal gantt 2');
                logger.error(err);
            }
        }
    }
}

