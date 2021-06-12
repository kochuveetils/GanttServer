
const oracledb = require('oracledb');
const dbConfig = require('../dbconfig.js');
const log4js = require('Log4js');

// App settings

const MODULE = 'ganttdata';
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
        logger.debug("Query Strings in Gantt");
        logger.debug(querystring);

        var queryclause = '';
        var innerqueryclause = '';
        var contractqueryclause = '';
        var enddateclause = '';
        var strdateclause = '';
        Object.keys(querystring).map((obj, i) => {
            // logger.debug(obj);
            if (Object.values(querystring)[i] != 'undefined' & Object.values(querystring)[i] != '') {
                console.log('value exists ' + Object.values(querystring)[i])
                if (obj === 'legality') {
                    if (Object.values(querystring)[i] === 'false') {
                        innerqueryclause = ` and legal IN ('` + `I` + `','` + `E` + `')`;
                    }
                    else {
                        innerqueryclause = ` and legal IN ('` + `I` + `','` + `L` + `','` + `E` + `')`;
                    }
                }
                else if (obj === 'strdate') {
                    strdateclause = `TO_CHAR(to_DATE('` + Object.values(querystring)[i] + `','RRRR-MM-DD'),'DDMONRRRR')`;
                    // TO_CHAR(to_DATE('2021-04-25','RRRR-MM-DD'),'DDMONRRRR')
                    // contractqueryclause = ` and legal IN ('` + `I` + `,'` + `E` + `')`;
                    // queryclause = queryclause + ' and ' + obj + `='` + Object.values(querystring)[i] + `'`;
                }
                else if (obj === 'enddate') {
                    enddateclause = `TO_CHAR(to_DATE('` + Object.values(querystring)[i] + `','RRRR-MM-DD'),'DDMONRRRR')`;
                    // TO_CHAR(to_DATE('2021-04-25','RRRR-MM-DD'),'DDMONRRRR')
                    // contractqueryclause = ` and legal IN ('` + `I` + `,'` + `E` + `')`;
                    // queryclause = queryclause + ' and ' + obj + `='` + Object.values(querystring)[i] + `'`;
                }
                else {
                    if (Object.values(querystring)[i] != 'ALL')
                        contractqueryclause = contractqueryclause + ' and ' + obj + `='` + Object.values(querystring)[i] + `'`;
                }
            }
            else {
                console.log('value UNDEFINED')
            }
        });
        logger.debug("Query contractqueryclause Clause in Gantt" + contractqueryclause);
        logger.debug("Query strdateclause Clause in Gantt" + strdateclause);
        logger.debug("Query enddateclause Clause in Gantt" + enddateclause);
        logger.debug("Query innerqueryclause Clause in Gantt" + innerqueryclause);

        if (contractqueryclause === '') {
            contractqueryclause = ` `;
            // contractqueryclause = ` and contract_cd = 'PA75'`;
        }

        if (enddateclause === '') {
            enddateclause = ` `;
        }
        else {
            enddateclause = ` and SIGNONBNE <= ` + enddateclause;
        }

        if (strdateclause === '') {
            strdateclause = ` `;
        }
        else {
            strdateclause = ` and SIGNONBNE >= ` + strdateclause;
        }

        // if (enddateclause === '') {
        //     enddateclause = `'30mar2021'`;
        // }

        // if (strdateclause === '') {
        //     strdateclause = `'15mar2021'`;
        // }

        if (innerqueryclause === '') {
            innerqueryclause = ` AND LEGAL IN ('I','E')`;
        }

        const fn =
            `DECLARE 
            `+
            `pi_sign_on             VARCHAR2 (100) := ` + enddateclause + `;`
            +
            `
        pi_series_num          NUMBER := null;        
        pi_staff_num           crew_v.staff_num%TYPE:=null;
        pi_duration            NUMBER := 22;
        pi_output              CHAR (1) := 'N';
        po_duty_seq_num        NUMBER;
        po_acclim_port         VARCHAR2 (100);
        po_signon_port         VARCHAR2 (100);
        po_acclim_status       VARCHAR2 (100);
        po_acclim_signon       DATE;
        po_acclim_signon_sby   DATE;
        po_unknown_rest        NUMBER;
        po_acclim_tab          pkg_acclimatisation.pltab_acclim;
        po_error_status        VARCHAR2 (100);
        po_error_desc          VARCHAR2 (2000);
        po_max_fdp             NUMBER;
        po_actual_fdp          NUMBER;
        po_legal               CHAR (1);
     BEGIN
     for rec_crew in (SELECT   c.staff_num,
        c.first_name ,
        c.surname ,
        cb.base ,
        cr.rank_cd 
 FROM   crew_contracts_v con,
        crew_base_v cb,
        crew_rank_v cr,
        crew_v c
WHERE     cb.staff_num = c.staff_num
        and cb.eff_dt <= SYSDATE
        AND (cb.exp_dt >= SYSDATE OR cb.exp_dt IS NULL)
        AND cr.staff_num = c.staff_num
        AND cr.eff_dt <= SYSDATE
        AND (cr.exp_dt >= SYSDATE OR cr.exp_dt IS NULL)
        AND con.staff_num = c.staff_num
        AND con.eff_dt <= SYSDATE
        AND (con.exp_dt >= SYSDATE OR con.exp_dt IS NULL)
        AND CB.PRIM_BASE = 'Y'`+ contractqueryclause
            +
            ` AND (c.term_dt >SYSDATE or c.term_dt is null)
        AND (c.retr_dt >SYSDATE or c.retr_dt is null))
loop
        pkg_acclimatisation.proc_populate_fdp ( pi_series_num,
                                               pi_sign_on,
                                               rec_crew.staff_num,
                                               pi_duration,
                                               pi_output,
                                               0,
                                               0,
                                               po_acclim_tab,
                                               po_error_status,
                                               po_error_desc);
        IF po_error_status = 'Y' then
         exit;
        end if;
     end loop;
     
        IF po_error_status = 'Y'
        THEN
        ROLLBACK;
           DBMS_OUTPUT.put_line ('Acclimatisation Status ' || po_error_desc);
        ELSE
        commit;
           DBMS_OUTPUT.put_line ('Procedure Success');
        END IF;
     END;`;

        //         const fn =
        //             `DECLARE
        //             --pi_series_num          NUMBER := 10491970;
        //             pi_series_num          NUMBER := null;
        //              pi_sign_on             VARCHAR2 (100) := '31dec2020';
        //             pi_staff_num           crew_v.staff_num%TYPE := '2532';
        //             --pi_staff_num           crew_v.staff_num%TYPE := '3680';
        //             --pi_staff_num           crew_v.staff_num%TYPE := '21052';
        //             pi_duration            NUMBER := 22;
        //             pi_output              CHAR (1) := 'N';
        //             po_duty_seq_num        NUMBER;
        //             po_acclim_port         VARCHAR2 (100);
        //             po_signon_port         VARCHAR2 (100);
        //             po_acclim_status       VARCHAR2 (100);
        //             po_acclim_signon       DATE;
        //             po_acclim_signon_sby   DATE;
        //             po_unknown_rest        NUMBER;
        //             po_acclim_tab          pkg_acclimatisation.pltab_acclim;
        //             po_error_status        VARCHAR2 (100);
        //             po_error_desc          VARCHAR2 (2000);
        //             po_max_fdp             NUMBER;
        //             po_actual_fdp          NUMBER;
        //             po_legal               CHAR (1);
        //          BEGIN
        //          for rec_crew in (SELECT   c.staff_num,
        //             c.first_name ,
        //             c.surname ,
        //             cb.base ,
        //             cr.rank_cd 
        //      FROM   crew_contracts_v con,
        //             crew_base_v cb,
        //             crew_rank_v cr,
        //             crew_v c
        //     WHERE     cb.staff_num = c.staff_num
        //             and cb.eff_dt <= SYSDATE
        //             AND (cb.exp_dt >= SYSDATE OR cb.exp_dt IS NULL)
        //             AND cr.staff_num = c.staff_num
        //             AND cr.eff_dt <= SYSDATE
        //             AND (cr.exp_dt >= SYSDATE OR cr.exp_dt IS NULL)
        //             AND con.staff_num = c.staff_num
        //             AND con.eff_dt <= SYSDATE
        //             AND (con.exp_dt >= SYSDATE OR con.exp_dt IS NULL)
        //             AND CB.PRIM_BASE = 'Y'
        //             AND con.contract_cd IN ('PAGG','PA50','PA75')
        //             --AND con.contract_cd IN ('PAGG')
        //             -- AND CR.RANK_CD = 'CPT'
        //             --and cb.base= 'BNE'
        //             --and c.staff_num in ('21052','3610')
        //             --and c.staff_num in ('21720')
        //             --and c.staff_num in ('21280')
        //             and c.staff_num = pi_staff_num
        //             --AND con.contract_cd IN ('PAGG','PA50','PA75')
        //             AND (c.term_dt >SYSDATE or c.term_dt is null)
        //             AND (c.retr_dt >SYSDATE or c.retr_dt is null))
        //    loop
        //             pkg_acclimatisation.proc_populate_fdp (   pi_series_num,
        //                                                    pi_sign_on,
        //                                                    --pi_staff_num,
        //                                                    rec_crew.staff_num,
        //                                                    pi_duration,
        //                                                    pi_output,
        //                                                    0,
        //                                                    0,
        //                                                    po_acclim_tab,
        //                                                    po_error_status,
        //                                                    po_error_desc);
        //             IF po_error_status = 'Y' then
        //              exit;
        //             end if;
        //          end loop;

        //             IF po_error_status = 'Y'
        //             THEN
        //             rollback;
        //                DBMS_OUTPUT.put_line ('Acclimatisation Status ' || po_error_desc);
        //             ELSE
        //             commit;
        //                DBMS_OUTPUT.put_line ('Procedure Success');
        //             END IF;
        //          END;`;


        //         sql = `SELECT 
        //         STAFF "staff",
        //         SIGNON "signon",
        //         ROSTERNUM "rosternum",
        //         SERIESNUM "seriesnum",
        //         DUTYSEQ "dutyseqnum",
        //         SIGNONBNE "signonbne",
        //         DUTYSECTOR "sector",
        //         DUTYTYPE "dutytype",
        //         DUTYCAT "dutycategory",
        //         SIGNOFF "signoffbne",
        //         LASTACCLPORT "lastacclport",
        //         LASTACCLSONBNE "lastacclsonbne",
        //         TZDIFF "tzdiff",
        //         to_char(TIMESINCELASTACCL) "timesincelastaccl",
        //         MAXTZ "maxtz",
        //         to_char(ADAPTTIME) "adapttime",
        //         to_char(ADAPTNT) "adaptnt",
        //         to_char(RESTBEF) "restbef",
        //         ACCLIMSBYSIGNON "acclimsbysignon",
        //         ACCLIMFDPSIGNON "acclimfdpsignon",
        //         ACCLMSTATUS "acclmstatus",
        //         TO_CHAR(ACTFDP) "actfdp",
        //         TO_CHAR(MAXFDP) "maxfdp",
        //         to_char(BUFFEROVER) "bufferover",
        //         to_char(BUFFERUNDER) "bufferunder",
        //         LEGAL "legal"
        //    FROM VA_NBFC_FDP_GANTT_V x
        //    --where exists (select 1 from VA_NBFC_FDP_GANTT_V y where y.staff = x.staff and legal = 'I')
        //    --staff  in ('3680','21720') 
        //    --staff  in ('13066','21720')   
        //    order by STAFF,signonbne`;

        sql = `SELECT 
        STAFF "staff",
        firstname "firstname",
        surname "surname",
        base "base",
        rank_cd "rank",
        contract_cd "contract",
        SIGNON "signon",
        ROSTERNUM "rosternum",
        SERIESNUM "seriesnum",
        DUTYSEQ "dutyseqnum",
        DUTYATTRIBUTE "dutyattribute",
        SIGNONBNE "signonbne",
        DUTYSECTOR "sector",
        DUTYTYPE "dutytype",
        DUTYCAT "dutycategory",
        SIGNOFF "signoffbne",
        LASTACCLPORT "lastacclport",
        LASTACCLSONBNE "lastacclsonbne",
        TZDIFF "tzdiff",
        to_char(TIMESINCELASTACCL) "timesincelastaccl",
        MAXTZ "maxtz",
        to_char(ADAPTTIME) "adapttime",
        to_char(ADAPTNT) "adaptnt",
        to_char(RESTBEF) "restbef",
        ACCLIMSBYSIGNON "acclimsbysignon",
        ACCLIMFDPSIGNON "acclimfdpsignon",
        SECTORCOUNT "sectorcount",
        ACCLMSTATUS "acclmstatus",
        TO_CHAR(ACTFDP) "actfdp",
        TO_CHAR(MAXFDP) "maxfdp",
        to_char(BUFFEROVER) "bufferover",
        to_char(BUFFERUNDER) "bufferunder",
        LEGAL "legal",
        case when trunc(runtime)=trunc(signonbne) then '*' else null end "currdate", 
        --rundate "runenddate",
        --to_CHAR(to_date(rundate,'DDMONRRRR')-`+ legalitywindow + `,'DDMONRRRR') "runstrdate",
        TO_CHAR(to_date(rundate,'DDMONRRRR'),'RRRR-MM-DD') "runenddate",
        TO_CHAR(to_date(rundate,'DDMONRRRR')-`+ legalitywindow + `,'RRRR-MM-DD') "runstrdate",
        --to_date(TO_DATE(rundate,'DDMONRRRR'),'RRRR-MM-DD') "runenddate",
        --to_date(TO_DATE(rundate,'DDMONRRRR'),'RRRR-MM-DD')-`+ legalitywindow + ` "runstrdate",
        duration "duration",
        runtime "runtime",
        runseqnum "runseqnum",
        ruleapp "ruleapp"
   FROM VA_NBFC_FDP_GANTT_V x   
   where exists (select 1 from VA_NBFC_FDP_GANTT_V y 
                 where y.staff = x.staff 
                  and signonbne >=to_date(rundate,'DDMONRRRR')-`+ legalitywindow +
            ` AND RUNSEQNUM = x.RUNSEQNUM`
            + innerqueryclause + strdateclause + enddateclause + contractqueryclause
            + `) ` +
            ` and signonbne >=to_date(rundate,'DDMONRRRR')-` + legalitywindow +
            ` AND RUNSEQNUM = (SELECT MAX(RUNSEQNUM) FROM VA_NBFC_FDP_GANTT_V )`
            + contractqueryclause + strdateclause + enddateclause +
            ` order by STAFF,signonbne`;

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

        console.log(fn);
        console.log(sql);
        // execprocedure = await connection.execute(fn);
        execprocedure = true;

        if (execprocedure) {
            result = await connection.execute(sql, binds, options);
            if (result) {
                logger.debug('SQL executed in FDP Gantt :');
                logger.debug(sql);
                logger.debug("Query results Oracle FDP Gantt: ");
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

