FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
USER $APP_UID
WORKDIR /app
EXPOSE 8080
EXPOSE 8081

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["Warehouse.WebApi/Warehouse.WebApi.csproj", "Warehouse.WebApi/"]
COPY ["Warehouse.DataAccess/Warehouse.DataAccess.csproj", "Warehouse.DataAccess/"]
RUN dotnet restore "Warehouse.WebApi/Warehouse.WebApi.csproj"
COPY . .
WORKDIR "/src/Warehouse.WebApi"
RUN dotnet build "./Warehouse.WebApi.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "./Warehouse.WebApi.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
ENTRYPOINT ["dotnet", "Warehouse.WebApi.dll"]
