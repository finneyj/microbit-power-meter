#include "pxt.h"

/**
* share
* use
*/


//% color=#1a3300 weight=99 icon="\uf1e6" block="Energy Metering"
namespace energymeter {

    //%
    int setSensorPeriod(int period_us)
    {
        uBit.compass.setPeriod(period_us);
        return 1;
    }
};