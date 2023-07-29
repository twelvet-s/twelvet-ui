import React from 'react';
import { DatePicker as DatePickerAntd } from 'antd';
import type { DatePickerProps } from 'antd/es/date-picker';
import moment from 'moment';

const DatePicker: React.FC<DatePickerProps> = (props: any) => {
    const { value, defaultValue, ...rest } = props;
    const dateValue = value && moment(value);
    const defaultDateValue = defaultValue && moment(defaultValue);
    return <DatePickerAntd value={dateValue} defaultValue={defaultDateValue} {...rest} />;
};
export default DatePicker;
