/**
 * 任务详情
 */
export class TaskInfo {
    private readonly _rootPath: string
    public taskCount: number = 0

    constructor(rootPath: string) {
        this._rootPath = rootPath;
    }

    get rootPath(): string {
        return this._rootPath;
    }
}