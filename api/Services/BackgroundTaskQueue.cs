using System.Threading.Channels;

namespace KoolFruits.Api.Services;

public interface IBackgroundTaskQueue
{
    void Enqueue(Func<IServiceProvider, CancellationToken, Task> workItem);
    IAsyncEnumerable<Func<IServiceProvider, CancellationToken, Task>> ReadAllAsync(CancellationToken ct);
}

/// <summary>
/// In-memory work queue so order notifications (email, Google Sheets) run after the HTTP
/// response has already gone back to the customer — a slow or unreachable third party
/// should never make checkout wait or fail.
/// </summary>
public class BackgroundTaskQueue : IBackgroundTaskQueue
{
    private readonly Channel<Func<IServiceProvider, CancellationToken, Task>> _channel =
        Channel.CreateUnbounded<Func<IServiceProvider, CancellationToken, Task>>();

    public void Enqueue(Func<IServiceProvider, CancellationToken, Task> workItem) =>
        _channel.Writer.TryWrite(workItem);

    public IAsyncEnumerable<Func<IServiceProvider, CancellationToken, Task>> ReadAllAsync(CancellationToken ct) =>
        _channel.Reader.ReadAllAsync(ct);
}
