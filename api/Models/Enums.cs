namespace KoolFruits.Api.Models;

public enum OrderStatus
{
    New,
    Preparing,
    OutForDelivery,
    Delivered,
}

public enum PaymentMethod
{
    CashOnDelivery,
    BankTransfer,
}

public enum PreferredTimeType
{
    Asap,
    Scheduled,
}
