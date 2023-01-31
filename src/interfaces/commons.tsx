export interface StringSetter {
    (newStringValue: string): void;
}

export interface Setter {
    (newValue: any): void;
}

export interface StringProperties {
    [key: string]: string;
}

export interface NumberSetter {
    (newNumberValue: number): void;
}