import {GTFSFileStream} from "./GTFSFileStream";
import {TransXChange} from "../transxchange/TransXChange";

/**
 * Extract the agencies from the TransXChange objects
 */
export class AgencyStream extends GTFSFileStream<TransXChange> {
  private agenciesSeen: Record<string, boolean> = {};
  protected header = "agency_id,agency_name,agency_url,agency_timezone,agency_lang,agency_phone,agency_fare_url";
  private readonly agencyUrl = process.env.AGENCY_URL || "http://agency.com";
  private readonly agencyTimezone = process.env.AGENCY_TIMEZONE || "Europe/London";
  private readonly agencyLang = process.env.AGENCY_LANG || "en";

  protected transform(data: TransXChange): void {
    for (const operator of Object.values(data.Operators)) {
      if (!this.agenciesSeen[operator.NationalOperatorCode]) {
        const agencyName = operator.TradingName || operator.OperatorNameOnLicence || operator.OperatorShortName;

        this.pushLine(operator.NationalOperatorCode, agencyName, this.agencyUrl, this.agencyTimezone, this.agencyLang, "", "");

        this.agenciesSeen[operator.NationalOperatorCode] = true;
      }
    }
  }

}
