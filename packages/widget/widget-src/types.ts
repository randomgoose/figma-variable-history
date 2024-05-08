export interface ICommit {
    id: string;
    summary: string;
    description?: string;
    variables: Variable[];
    collections: VariableCollection[];
    date: number;
    // user: User | null | User[];
    collaborators: User[];
}

export enum ChangeType {
    ADD = "ADD",
    MODIFY = "MODIFY",
    DELETE = "DELETE"
}

export interface IChange {
    type: ChangeType;
    id: string;
    variableCollectionId: string;
    collectionName?: string;
    name?: string[];
    description?: string[];
    valuesByMode?: { [key: string]: VariableValue[] };
    codeSyntax: {
        iOS: string[];
        ANDROID: string[];
        WEB: string[];
    };
    resolvedType: Variable['resolvedType']
}