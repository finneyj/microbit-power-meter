// Extension to measure the AC fluctuation of the local magnetic field around the micro:bit, and 
// approximate the power consumption of nearby electrical current flow based on this electromagnetic field.

//% color=#1a3300 weight=99 icon="\uf1e6" block="Energy Metering"
namespace energymeter {
   
    let min_field = 0;      // minimum field strength measured in the last round.
    let max_field = 0;      // maximum field strength measured in the last round.
    let samples = 0;        // number of samples taken since the round began.
    let power = 0;          // approximation of the power measured in the last round.
    let scale = 100;        // scaling factor from uTeslas into Watts (approx).
    let threshold = 500;    // the threshold in Watts where the device is determines to be "on".
    let onState = false;    // true if the ME field is large enough to determine a device to be "on". False otherwise.
    let dataTrace = false;  // true if power data is being streamd to the serial port. flase otherwise. 

    let onPowerOnHandler: () => void;
    let onPowerOffHandler: () => void;

     /**
      * Defines the threshold at which a device is determines as "on"
      */
    //% weight=97
    //% blockId=set_electrical_power_threshold
    //% block="set electrical power|threshold %t Watts"
    export function setElectricalPowerThreshold(t: number)
    {
        threshold = t;
    }

     /**
      * Returns energy consumption by appliance
      */
    //% weight=97
    //% blockId=electrical_power_usage
    //% block="electrical power usage"
    export function getElectricalPowerUsage()
    {
        return power;
    }

     /**
      * Returns the on/off status of the electrical power.
      */
    //% weight=98
    //% blockId=electrical_power_on
    //% block="electrical power on"
    export function electricalPowerOn() : boolean
    {
        return onState;
    }

    /**
      * Defines if data streaming to the serial port is enabled
      */
    //% weight=97
    //% blockId=set_data_trace_enabled
    //% block="enable|data tracing %e"
    export function enableDataTrace(e: boolean)
    {
        dataTrace = e;
    }

    /**
     * Event handler that is trigger when the measured power exceeds the defined threshold
     */
    //% weight=98
    //% blockId=on_electrical_power_on
    //% block="on electrical power turned on"
    export function onPowerOn(handler: () => void) {
        onPowerOnHandler = handler;
    }

    /**
     * Event handler that is trigger when the measured power drops below the defined threshold
     */
    //% weight=98
    //% blockId=on_electrical_power_off
    //% block="on electrical power turned off"
    export function onPowerOff(handler: () => void) {
        onPowerOffHandler = handler;
    }

    // Event handler for compass data ready
    control.onEvent(6, 1, function() {
        let s = input.magneticForce(Dimension.Strength);

        if (min_field == 0) 
            min_field = s;

        if (max_field == 0)
            max_field = s;

        if (s < min_field)
            min_field = s;
        
        if (s > max_field)
            max_field = s;

        samples++;

        if (samples > 20)
        {
            power = (max_field - min_field) *scale;
            samples = 0;
            max_field = 0;
            min_field = 0;

            if (power > threshold)
            {   
                if (!onState)
                {
                    onState = true;
                    onPowerOnHandler();
                }
            }

            if (power < threshold-100)
            {
                if (onState)
                {
                    onState = false;
                    onPowerOffHandler();
                }
            }

            if (dataTrace)
            {
                serial.writeString("POWER: ");
                serial.writeNumber(power);
                serial.writeString(" Watts\n");
            }
        }
    })
}