FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY KoolFruits.Api.csproj .
RUN dotnet restore

COPY . .
RUN dotnet publish -c Release -o /app --no-restore

FROM mcr.microsoft.com/dotnet/aspnet:10.0 AS runtime
WORKDIR /app
COPY --from=build /app .

# Render assigns the port to listen on via $PORT at container start (not known at build
# time), so this needs shell-form ENTRYPOINT to expand it — exec-form (JSON array) does
# not do shell substitution.
ENV ASPNETCORE_ENVIRONMENT=Production
ENTRYPOINT ASPNETCORE_URLS=http://+:$PORT dotnet KoolFruits.Api.dll
